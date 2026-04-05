export default function BookingPreviewPage() {
  const booking = {
    facility: "Main Auditorium",
    category: "Event Hall",
    date: "April 12, 2026",
    time: "9:00 AM - 1:00 PM",
    requester: "Shehan Perera",
    department: "Computer Science Department",
    attendees: 120,
    purpose: "Final year project presentation and evaluation session.",
    equipment: ["Projector", "Sound System", "Wireless Microphones", "Air Conditioning"],
    status: "Pending Approval",
    reference: "BK-2026-0412-018",
    notes: "Please ensure seating is arranged in presentation style before 8:30 AM.",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Campus Facilities Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Booking Preview
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              Review facility reservation details before confirming, editing, or submitting the booking request.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100">
              Edit Booking
            </button>
            <button className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
              Confirm Booking
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {booking.category}
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                    {booking.facility}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Reference ID: {booking.reference}
                  </p>
                </div>

                <div className="self-start rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                  {booking.status}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Booking Details</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoCard label="Date" value={booking.date} />
                <InfoCard label="Time" value={booking.time} />
                <InfoCard label="Requester" value={booking.requester} />
                <InfoCard label="Department" value={booking.department} />
                <InfoCard label="Expected Attendees" value={`${booking.attendees} People`} />
                <InfoCard label="Purpose" value={booking.purpose} />
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Requested Equipment</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {booking.equipment.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Additional Notes</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{booking.notes}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-sm">
              <h3 className="text-lg font-semibold">Booking Summary</h3>
              <div className="mt-5 space-y-4">
                <SummaryRow label="Facility" value={booking.facility} />
                <SummaryRow label="Date" value={booking.date} />
                <SummaryRow label="Time" value={booking.time} />
                <SummaryRow label="Attendees" value={`${booking.attendees}`} />
                <SummaryRow label="Status" value={booking.status} />
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Policy Reminder</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Bookings are subject to administrative approval.</li>
                <li>Any cancellation should be made at least 24 hours in advance.</li>
                <li>Damages to equipment or facilities may incur additional charges.</li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Actions</h3>
              <div className="mt-4 space-y-3">
                <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                  Submit for Approval
                </button>
                <button className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                  Save as Draft
                </button>
                <button className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100">
                  Cancel Booking
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-3 text-sm last:border-none last:pb-0">
      <span className="text-slate-300">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
