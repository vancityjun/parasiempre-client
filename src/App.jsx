import "./App.scss";
import Info from "./components/Info";
import Rsvp from "./components/Rsvp";
// import { Schedules } from "./components/Schedules/Schedules";

function App() {
  return (
    <div className="main">
      <div className="banner"></div>
      <div className="wrapper">
        <section className="title">
          <h1>Jun & Leslie’s Wedding</h1>
          <p className="align-center">
            We invite you to join us on our special day!
          </p>
        </section>
        <Info />
        {/* <Schedules /> */}
      </div>
      <Rsvp />
    </div>
  );
}

export default App;
