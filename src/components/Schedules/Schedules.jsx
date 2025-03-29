import timelineData from "./timeline.json";
import "./Schedules.scss";

export const Schedules = () => {
  return (
    <section>
      <h1>Timeline</h1>
      <div className="schedule-wrapper">
        {timelineData.map(({ time, content }, index) => (
          <div key={index} className="schedule">
            <span className="medium-wight">{time}</span>
            <p>{content}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
