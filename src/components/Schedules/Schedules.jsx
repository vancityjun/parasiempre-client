import timelineData from "./timeline.json";

export const Schedules = () => {
  return (
    <section>
      <h1>Timeline</h1>
      <div>
        {timelineData.map(({ time, content }, index) => (
          <div key={index}>
            <span>{time}</span>
            <span>{content}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
