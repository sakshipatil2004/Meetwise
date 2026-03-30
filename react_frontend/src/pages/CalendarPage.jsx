import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function CalendarPage() {
    const [events, setEvents] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/reports/${user.id}`)
            .then(res => res.json())
            .then(data => {
                const formattedEvents = data.map(report => ({
                    title: `Report #${report.id}`,
                    start: new Date(report.created_at),
                    end: new Date(report.created_at),
                    allDay: true,
                    pdf_path: report.pdf_path
                }));

                setEvents(formattedEvents);
            })
            .catch(err => console.error(err));
    }, []);

    const handleSelectEvent = (event) => {
        window.open(`http://127.0.0.1:8000/${event.pdf_path}`, "_blank");
    };

    return (
        <div style={{ height: "80vh", padding: "20px" }}>
            <h2>Reports Calendar</h2>

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
            />
        </div>
    );
}

export default CalendarPage;