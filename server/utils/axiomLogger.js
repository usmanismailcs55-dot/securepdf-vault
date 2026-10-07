const { Axiom } = require("@axiomhq/js");

const axiom =
  process.env.AXIOM_TOKEN
    ? new Axiom({
        token: process.env.AXIOM_TOKEN,
        edge: "us-east-1.aws.edge.axiom.co",
        onError: (error) => {
          console.error("Axiom logging error:", error.message);
        },
      })
    : null;

const logToAxiom = async (event) => {
  if (!axiom) {
    return;
  }

  try {
    axiom.ingest("securepdf-vault", [
      {
        _time: new Date().toISOString(),
        service: "securepdf-vault-api",
        ...event,
      },
    ]);

    await axiom.flush();
  } catch (error) {
    console.error("Axiom ingest failed:", error.message);
  }
};

module.exports = logToAxiom;