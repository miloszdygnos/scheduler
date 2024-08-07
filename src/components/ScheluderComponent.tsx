import { useState, useCallback, useEffect } from "react";
import Paper from "@mui/material/Paper";
import {
  ViewState,
  EditingState,
  IntegratedEditing,
} from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  WeekView,
  Appointments,
  Toolbar,
  ViewSwitcher,
  MonthView,
  DayView,
  DateNavigator,
  TodayButton,
  AppointmentForm,
  AppointmentTooltip,
} from "@devexpress/dx-react-scheduler-material-ui";
import { myCollection, db } from "../config";
import { getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

function timestampToISO(timestamp: number) {
  const date = new Date((timestamp + 7200) * 1000); // Convert seconds to milliseconds
  return date.toISOString().slice(0, 16); // Format as 'YYYY-MM-DDTHH:MM'
}
function getCurrentDay() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type Task = {
  id: string;
  title: string;
  notes: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
};

export default function SchedulerComponnet() {
  const [appointments, setAppointments] = useState<Task[]>([]);
  const [currentDay, setCurrentDay] = useState(getCurrentDay());
  const [currentViewName, setCurrentViewName] = useState("Week");
  const [reload, setReload] = useState(false);
  const commitChanges = useCallback(async ({ added, changed, deleted }) => {
    try {
      if (added) {
        await addDoc(myCollection, added);
        setReload((prev) => !prev);
      }

      if (changed) {
        for (const [id, changes] of Object.entries(changed)) {
          const docRef = doc(db, "TasksData", id);
          await updateDoc(docRef, changes);
          setReload((prev) => !prev);
        }
      }

      if (deleted) {
        const docRef = doc(db, "TasksData", deleted);
        await deleteDoc(docRef);
        setReload((prev) => !prev);
      }
    } catch (error) {
      console.error("Error committing changes: ", error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getDocs(myCollection);
      const data = response.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // startDate: timestampToISO(doc.startDate.seconds),
        // endDate: timestampToISO(doc.endDate.seconds),
      }));
      const transformedData = data.map((doc) => ({
        ...doc,
        startDate: timestampToISO(doc.startDate.seconds),
        endDate: timestampToISO(doc.endDate.seconds),
      }));
      setAppointments([...transformedData]);
    };
    fetchData();
  }, [reload]);

  return (
    <Paper>
      <Scheduler data={appointments}>
        <ViewState
          defaultCurrentDate={currentDay}
          currentViewName={currentViewName}
          onCurrentDateChange={(date) => {
            setCurrentDay(date);
          }}
          defaultCurrentViewName="Week"
          onCurrentViewNameChange={(name) => {
            setCurrentViewName(name);
          }}
        />
        <EditingState onCommitChanges={commitChanges} />
        <IntegratedEditing />
        <DayView startDayHour={9} endDayHour={17} />
        <WeekView startDayHour={9} endDayHour={17} />

        <MonthView />
        <Toolbar />
        <DateNavigator />
        <TodayButton />
        <ViewSwitcher />
        <Appointments />
        <AppointmentTooltip showCloseButton showOpenButton />
        <AppointmentForm />
      </Scheduler>
    </Paper>
  );
}
