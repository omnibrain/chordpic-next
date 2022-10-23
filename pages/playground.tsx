const Playground = () => {
  return (
    <>
      <button
        type="button"
        onClick={() => {
          throw new Error("Sentry Frontend Error");
        }}
      >
        Throw error
      </button>
    </>
  );
};

export default Playground;
