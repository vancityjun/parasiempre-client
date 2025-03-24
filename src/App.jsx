import "./App.scss";
import Info from "./components/Info";
import Rsvp from "./components/Rsvp";

function App() {
  return (
    <div className="main">
      <nav>
        <h2>Jun & Leslie’s Wedding</h2>
      </nav>
      <div className="banner"></div>
      <div className="wrapper">
        <section>
          <h1>We’re inviting you!</h1>
        </section>
        <Info />
        <Rsvp />
      </div>
    </div>
  );
}

export default App;
