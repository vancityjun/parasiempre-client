import timelineData from "./timeline.json";
import "./Schedules.scss";

export const Schedules = () => {
  return (
    <section>
      <h2>Timeline</h2>
      <div className="schedule-wrapper">
        {timelineData.map(({ time, content, className }, index) => (
          <div key={index} className={`schedule ${className}`}>
            <span className="medium-wight">{time}</span>
            <p>{content}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
