import DayPickerInput from "react-day-picker/DayPickerInput";
import dateFnsFormat from "date-fns/format";
import dateFnsParse from "date-fns/parse";

// Next.js needs @zeit/next-css installed to know how to handle imported CSS files.
// Add a next.config.js in the root to support it.
import "react-day-picker/lib/style.css";

const parseDate = (str, format, locale) => {
  const parsed = dateFnsParse(str, format, new Date(), { locale });
  return DateUtils.isDate(parsed) ? parsed : null;
};

const formatDate = (date, format, locale) =>
  dateFnsFormat(date, format, { locale });

const format = "dd MMM yyyy";

export default () => (
  <div className="date-range-picker-container">
    <div>
      <label>From:</label>
      <DayPickerInput
        formatDate={formatDate}
        format={format}
        parseDate={parseDate}
        placeholder={`${dateFnsFormat(new Date(), format)}`}
        dayPickerProps={{
          modifiers: {
            disabled: {
              before: new Date(),
            },
          },
        }}
      />
    </div>
    <div>
      <label>To:</label>
      <DayPickerInput
        formatDate={formatDate}
        format={format}
        parseDate={parseDate}
        placeholder={`${dateFnsFormat(new Date(), format)}`}
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
