import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Stack,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Brightness4Icon from '@mui/icons-material/Brightness4';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import Calendar from 'react-calendar';

import 'react-calendar/dist/Calendar.css';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { CalendarContainer, CustomHeader, CustomPaper } from '../styles/CalendarComponent';
import FormModal from '../modal/FormModal';
import { useNavigate } from 'react-router-dom';

// -----------> Main Calendar Component
const CalendarComponent = () => {
    const navigate = useNavigate();

    //------------------Find Mobile Screen-------------------------
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // -----------Used to hold the currently selected date-----------
    const [selectedData, setSelectedData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs().toDate());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    const handleDarkMode = () => {
        setDarkMode((prev) => !prev);
    };

    // ----------Manage form inputs------------
    const [formData, setFormData] = useState({
        doctor: '',
        patient: '',
        time: ''
    });

    // ----------------> Form Modal State and Handlers
    // -------For Modal open---------
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    };

    // --------Close modal-----------
    const handleClose = () => {
        setSelectedEvent(null); // clear editing state
        setOpen(false);
        setFormData({ doctor: '', patient: '', time: '' }); // clear the form data
    };

    // --------------> Calendar Events Management
    // ---------Store calendar events-----------
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('events');
        if (saved) {
            const parsedObject = JSON.parse(saved);
            // This converts strings back into Date objects
            return parsedObject.map((event) => ({
                title: event.title,
                start: new Date(event.start),
                end: new Date(event.end),
                allDay: event.allDay || false, // Optional: in case needed
            }));
        }
        return [];
    });

    // -------Add new event to calendar--------
    const handleAddEvent = (newEvent) => {
        const eventCopy = { ...newEvent };
        if (selectedEvent) {
            // Edit existing
            setEvents((prev) =>
                prev.map((event) => (event === selectedEvent ? eventCopy : event))
            );
            setSelectedEvent(null);

        } else {
            // Add new
            setEvents((prevEvents) => [...prevEvents, eventCopy]);
        }
    };

    //-------------> delete function
    const handleDeleteEvent = (deleteEvent) => {
        setEvents((prevEvents) =>
            prevEvents.filter((event) => event !== deleteEvent)
        );
        handleClose();
    };

    useEffect(() => {
        // Save events to localStorage
        localStorage.setItem('events', JSON.stringify([...events]));
    }, [events]);

    return (
        <>
            {/* --------------Wrapper for full-page layout----------- */}
            <CalendarContainer
                sx={{
                    padding: isMobile ? "20px" : "10px",
                    alignItems: isMobile ? 'start' : 'start',
                    background: darkMode && 'black'
                }}
            >
                {/* -------------Paper container for calendar layout---------- */}
                <CustomPaper elevation={6}>
                    {/* ------------Title of the calendar--------------- */}
                    <CustomHeader
                        sx={{
                            background: darkMode && 'linear-gradient(90deg, #1e3c72, #2a5298)'
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 600,
                                letterSpacing: 1,
                                fontVariant: 'small-caps',
                                fontSize: isMobile && '1.7rem'
                            }}
                        >
                            Clinic Calendar
                        </Typography>
                        <Stack direction="row" spacing={isMobile ? 2 : 4} sx={{ alignItems: 'center' }}>
                            <Button
                                onClick={() => navigate('/')}
                                sx={{
                                    background: '#b12020de',
                                    color: 'white',
                                    fontSize: isMobile ? '.6rem' : '.7rem'
                                }}
                                size="small"
                            >
                                Logout
                            </Button>
                            {!darkMode ? (
                                <Brightness4Icon onClick={handleDarkMode} sx={{ cursor: 'pointer' }} />
                            ) : (
                                <DarkModeIcon onClick={handleDarkMode} sx={{ cursor: 'pointer' }} />
                            )}
                        </Stack>
                    </CustomHeader>

                    {/* -------------Calendar component------------ */}
                    <Box sx={{ padding: '20px', display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", background: darkMode ? '#d0d2d4ff' : '#fff' }}>
                        {isMobile ? (
                            <>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Select Date"
                                        value={dayjs(selectedDate)}
                                        onChange={(newValue) => {
                                            setSelectedDate(newValue.toDate());
                                        }}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </LocalizationProvider>

                                <Button
                                    variant="contained"
                                    sx={{
                                        margin: '10px auto',
                                        width: '100%',
                                        background: darkMode
                                            ? 'linear-gradient(90deg, #1e3c72, #2a5298)'
                                            : 'linear-gradient(90deg, #2196f3, #9c27b0)'
                                    }}
                                    onClick={() => {
                                        setSelectedData(selectedDate); // pass selected date to modal
                                        handleOpen(); // open modal for adding event
                                    }}
                                >
                                    Add
                                </Button>

                                {/* --------Show events on selected date-------- */}
                                {events
                                    .filter((event) => dayjs(event.start).isSame(dayjs(selectedDate), 'day'))
                                    .map((event, index) => {
                                        const [doctor, patient, time] = event.title.split(' - ').map((s) => s.trim());

                                        return (
                                            <Button
                                                key={index}
                                                variant="contained"
                                                fullWidth
                                                disableElevation
                                                sx={{
                                                    justifyContent: 'flex-start',
                                                    color: 'black',
                                                    background: 0,
                                                    margin: '5px auto',
                                                    borderBottom: '1px solid black'
                                                }}
                                                onClick={() => {
                                                    setSelectedData(event.start);
                                                    setSelectedEvent(event);
                                                    setFormData({ doctor, patient, time });
                                                    handleOpen();
                                                }}
                                            >
                                                {event.title}
                                            </Button>
                                        );
                                    })}
                            </>
                        ) : (
                            <>
                                {/* ---------react-calendar----------- */}
                                <Calendar
                                    value={selectedDate}
                                    onClickDay={(date) => {
                                        setSelectedDate(date);
                                    }}
                                    tileContent={({ date }) => {
                                        const dayEvents = events.filter(
                                            (event) => new Date(event.start).toDateString() === date.toDateString()
                                        );

                                        return (
                                            <div className="custom-date-tile">
                                                <div className="event-list">
                                                    {dayEvents.map((event, index) => (
                                                        <div
                                                            key={index}
                                                            title={event.title}
                                                            className="event-item"
                                                        >
                                                            {event.title}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/*------------ + Icon - only visible on hover------- */}
                                                <span
                                                    className="add-icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // ---Prevent triggering other clicks
                                                        setSelectedDate(date);
                                                        setSelectedData(date);
                                                        handleOpen(); // open modal
                                                    }}
                                                >
                                                    <AddCircleOutlineIcon />
                                                </span>
                                            </div>
                                        );
                                    }}
                                />

                                {/*-------- Show events----- */}
                                {events
                                    .filter((event) => dayjs(event.start).isSame(dayjs(selectedDate), 'day'))
                                    .map((event, index) => {
                                        const [doctor, patient, time] = event.title.split(' - ').map((s) => s.trim());
                                        return (
                                            <Button
                                                key={index}
                                                variant="contained"
                                                fullWidth
                                                disableElevation
                                                sx={{
                                                    justifyContent: 'flex-start',
                                                    color: 'black',
                                                    background: 0,
                                                    margin: '5px auto',
                                                    borderBottom: '1px solid black'
                                                }}
                                                onClick={() => {
                                                    setSelectedData(event.start);
                                                    setSelectedEvent(event);
                                                    setFormData({ doctor, patient, time });
                                                    handleOpen();
                                                }}
                                            >
                                                {event.title}
                                            </Button>
                                        );
                                    })}
                            </>
                        )}
                    </Box>
                </CustomPaper>
            </CalendarContainer>

            {/* --------Modal form to add/edit events------------- */}
            <FormModal
                open={open}
                handleClose={handleClose}
                input={formData}
                setInput={setFormData}
                selectedData={selectedData}
                onAdd={handleAddEvent}
                selectedEvent={selectedEvent}
                onDelete={handleDeleteEvent}
                darkMode={darkMode}
            />
        </>
    );
};

export default CalendarComponent;
