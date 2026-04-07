export default function TicketPreviewPage() {
  const ticket = {
    id: "TCK-2026-0412-024",
    title: "Projector Not Working in Lecture Hall A",
    category: "Equipment Issue",
    priority: "High",
    status: "Open",
    submittedBy: "Shehan Perera",
    department: "Computer Science Department",
    facility: "Lecture Hall A",
    submittedDate: "April 7, 2026",
    expectedResolution: "Within 24 hours",
    description:
      "The projector in Lecture Hall A does not power on. A lecture is scheduled for tomorrow morning, so immediate attention is required.",
    assignedTo: "Facilities Support Team",
    attachments: ["projector-front-view.jpg", "power-connection.jpg"],
    notes:
      "Please inspect the power supply and HDMI connection. Spare projector may be required if repair cannot be completed today.",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-600">
              Campus Facilities Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Ticket Preview
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              Review the support ticket details before submitting, editing, or assigning the request.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl border border-green-300 bg-green-50 px-5 py-2.5 text-sm font-medium text-green-700 shadow-sm hover:bg-green-100">
              Edit Ticket
            </button>
            <button className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:opacity-90">
              Submit Ticket
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-md">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {ticket.category}
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                    {ticket.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">Ticket ID: {ticket.id}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                    {ticket.priority} Priority
                  </span>
                  <span className="rounded-2xl border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                    {ticket.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold text-slate-900">Ticket Details</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoCard label="Submitted By" value={ticket.submittedBy} />
                <InfoCard label="Department" value={ticket.department} />
                <InfoCard label="Facility" value={ticket.facility} />
                <InfoCard label="Submitted Date" value={ticket.submittedDate} />
                <InfoCard label="Assigned To" value={ticket.assignedTo} />
                <InfoCard label="Expected Resolution" value={ticket.expectedResolution} />
              </div>
            </div>

            <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold text-slate-900">Issue Description</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{ticket.description}</p>
            </div>

            <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold text-slate-900">Attachments</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {ticket.attachments.map((file) => (
                  <span
                    key={file}
                    className="rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    {file}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold text-slate-900">Additional Notes</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{ticket.notes}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-green-600 to-emerald-600 p-6 text-white shadow-md">
              <h3 className="text-lg font-semibold">Ticket Summary</h3>
              <div className="mt-5 space-y-4">
                <SummaryRow label="Ticket ID" value={ticket.id} />
                <SummaryRow label="Category" value={ticket.category} />
                <SummaryRow label="Priority" value={ticket.priority} />
                <SummaryRow label="Status" value={ticket.status} />
                <SummaryRow label="Facility" value={ticket.facility} />
              </div>
            </div>

            <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold text-slate-900">Support Guidelines</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Provide accurate issue details to speed up resolution.</li>
                <li>High-priority tickets are reviewed first by the support team.</li>
                <li>Attachments should clearly show the reported issue.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold text-slate-900">Actions</h3>
              <div className="mt-4 space-y-3">
                <button className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-medium text-white hover:opacity-90">
                  Confirm & Submit
                </button>
                <button className="w-full rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 hover:bg-green-100">
                  Save as Draft
                </button>
                <button className="w-full rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-100">
                  Delete Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-white to-green-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-green-600">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/20 pb-3 text-sm last:border-none last:pb-0">
      <span className="text-green-100">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
