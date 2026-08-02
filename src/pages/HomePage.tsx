import Map from "../components/Map/Map";

function HomePage() {
  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
      }}
    >
      <Map />
    </main>
  );
}

export default HomePage;