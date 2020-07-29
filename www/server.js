const app = require("../src/main");
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Started server at port ${port}`);
});
