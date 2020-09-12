import { useState } from "react";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { DateUtils } from "react-day-picker";
import dateFnsFormat from "date-fns/format";
import dateFnsParse from "date-fns/parse";

// Next.js needs @zeit/next-css installed to know how to handle imported CSS files.
// Add a next.config.js in the root to support it.
import "react-day-picker/lib/style.css";

const format = "dd MMM yyyy";
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const parseDate = (str, format, locale) => {
  const parsed = dateFnsParse(str, format, new Date(), { locale });
  return DateUtils.isDate(parsed) ? parsed : null;
};

const formatDate = (date, format, locale) =>
  dateFnsFormat(date, format, { locale });

const numberOfNightsBetweenDates = (startDate, endDate) => {
  const start = new Date(startDate); //clone
  const end = new Date(endDate); //clone
  let dayCount = 0;

  while (end > start) {
    dayCount++;
    start.setDate(start.getDate() + 1);
  }

  return dayCount;
};

const DateRangePicker = ({ datesChanged, bookedDates }) => {
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);

  bookedDates = bookedDates.map(date => {
    return new Date(date)
  })

  return (
    <div className="date-range-picker-container">
      <div>
        <label>From:</label>
        <DayPickerInput
          formatDate={formatDate}
          format={format}
          value={startDate}
          parseDate={parseDate}
          placeholder={`${dateFnsFormat(new Date(), format)}`}
          dayPickerProps={{
            modifiers: {
              disabled: [
                ...bookedDates, // we can't book any already-booked dates.
                {
                  before: new Date(), // start date can't be before today.
                }
              ],
            },
          }}
          onDayChange={(day) => {
            setStartDate(day);
            const newEndDate = new Date(day);
            // if the start date is set after the end date, change the end date to be
            // 1 day after the start date.
            if (numberOfNightsBetweenDates(day, endDate) < 1) {
              newEndDate.setDate(newEndDate.getDate() + 1);
              setEndDate(newEndDate);
            }
            datesChanged(day, newEndDate);
          }}
        />
      </div>
      <div>
        <label>To:</label>
        <DayPickerInput
          formatDate={formatDate}
          format={format}
          value={endDate}
          parseDate={parseDate}
          placeholder={`${dateFnsFormat(new Date(), format)}`}
          dayPickerProps={{
            modifiers: {
              disabled: [
                startDate, // we can't set the endDate to be the same as the startDate.
                ...bookedDates, // we can't book any already-booked dates.
                {
                  before: startDate, // we also can't select endDate before the startDate.
                },
              ],
            },
          }}
          onDayChange={(day) => {
            setEndDate(day);
            datesChanged(startDate, day);
          }}
        />
      </div>
      <style jsx>{`
        .date-range-picker-container div {
          display: grid;
          border: 1px solid #ddd;
          grid-template-columns: 30% 70%;
          padding: 10px;
        }
        label {
          padding-top: 10px;
        }
      `}</style>
      <style jsx global>{`
        .DayPickerInput input {
          width: 120px;
          padding: 10px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default DateRangePicker;
