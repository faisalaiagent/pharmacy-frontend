"use client";
// src/app/dashboard/prescriptions/page.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { prescriptionsApi } from "@/lib/api";
import { formatDate, getPrescriptionStatusColor } from "@/lib/utils";
import { toast } from "sonner";

export default function PrescriptionsPage() {
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState<"IMAGE" | "PDF">("IMAGE");
  const [doctorName, setDoctorName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["my-prescriptions"],
    queryFn: () => prescriptionsApi.getPrescriptions().then((r) => r.data.data),
  });

  const uploadMutation = useMutation({
    mutationFn: () =>
      prescriptionsApi.uploadPrescription({
        file_url: fileUrl,
        file_type: fileType,
        file_size_bytes: 100000,
        doctor_name: doctorName,
        patient_name: patientName,
        customer_notes: notes,
      }),
    onSuccess: () => {
      toast.success("Prescription uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-prescriptions"] });
      setUploadOpen(false);
      setFileUrl("");
      setDoctorName("");
      setPatientName("");
      setNotes("");
    },
    onError: () => toast.error("Upload failed. Please try again."),
  });

  const prescriptions = data?.results || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Prescriptions</h1>
        <Button
          className="bg-sky-500 hover:bg-sky-600 text-white"
          onClick={() => setUploadOpen(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Prescription
        </Button>
      </div>

      {/* Info banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="text-sm text-sky-700">
          <p className="font-medium">How prescriptions work</p>
          <p className="mt-0.5 text-sky-600">
            Upload your prescription image or PDF. Our licensed pharmacists will review it
            within 24 hours. Once approved, you can order prescription medicines.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="font-semibold text-gray-700">No prescriptions yet</h3>
            <p className="text-gray-500 text-sm mt-1">
              Upload a prescription to order prescription-only medicines
            </p>
            <Button className="mt-4 bg-sky-500 hover:bg-sky-600 text-white" onClick={() => setUploadOpen(true)}>
              Upload Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <Card key={rx.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-gray-800">
                          Prescription #{rx.id.slice(0, 8)}
                        </span>
                        <Badge className={`text-xs ${getPrescriptionStatusColor(rx.status)}`}>
                          {rx.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Uploaded {formatDate(rx.created_at)}
                        {rx.doctor_name && ` · Dr. ${rx.doctor_name}`}
                      </p>
                      {rx.customer_notes && (
                        <p className="text-xs text-gray-400 mt-1 italic">"{rx.customer_notes}"</p>
                      )}
                      {rx.reviews.length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-600">Pharmacist Review:</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {rx.reviews[rx.reviews.length - 1].comments || rx.reviews[rx.reviews.length - 1].rejection_reason || "Under review"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <a
                    href={rx.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sky-600 hover:underline shrink-0"
                  >
                    View File
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Prescription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              ⚕️ Upload a clear image or PDF of your prescription issued by a licensed doctor.
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">File URL</label>
              <input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/your-cloud/..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              <p className="text-xs text-gray-400">Upload your file to Cloudinary first, then paste the URL here</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">File Type</label>
              <div className="flex gap-3">
                {["IMAGE", "PDF"].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="fileType"
                      checked={fileType === type}
                      onChange={() => setFileType(type as "IMAGE" | "PDF")}
                      className="accent-sky-500"
                    />
                    <span className="text-sm text-gray-600">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Doctor Name</label>
                <input
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Dr. Ahmed"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Patient Name</label>
                <input
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Notes for Pharmacist</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific instructions or notes..."
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button
                className="bg-sky-500 hover:bg-sky-600 text-white"
                onClick={() => uploadMutation.mutate()}
                disabled={!fileUrl || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Prescription"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
