import * as express from "express";
import * as jwt from "jsonwebtoken";

const app = express();

// 秘密キーの設定 ※本来は環境変数等で設定すべき
app.set("superSecret", "secret");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

// 認証用URL
router.post("/auth", (req, res) => {
  const id = req.body.id;
  const pass = req.body.pass;

  if (id == "id" && pass == "pass") {
    const payload = { id: id };
    const token = jwt.sign(payload, app.get("superSecret"), {
      expiresIn: 100000,
    });
    res.json({ success: true, msg: "Success!", token: token });
    return;
  }
  res.json({ success: false, msg: "Failed..." });
});

// 認証処理
router.use((req, res, next) => {
  const token = req.body.token;
  if (!token) {
    return res.status(403).send({ success: false, msg: "No token..." });
  }
  jwt.verify(token, app.get("superSecret"), (err: any, decoded: any) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, msg: "Invalid token..." });
    }
    next();
  });
});

// 以下、認証が必要なURL
router.post("/private", (req, res) => {
  res.json({ msg: "Hello!!!" });
});

const server = app.use("/api", router);

app.listen(3000, () => console.log("Listening on http://localhost:3000"));

// 以下、テストアクセスを行う処理
const baseUrl = "http://localhost:3000/api/";
import axios from "axios";
async function test() {
  // 未認証で private にアクセス -> エラーレスポンス
  try {
    await axios.post(baseUrl + "private");
  } catch (err) {
    const res = err.response;
    console.log(`Status: ${res.status} Message: ${res.data.msg}`);
  }
  // 認証後に private にアクセス
  const res1 = await axios.post(baseUrl + "auth", { id: "id", pass: "pass" });
  console.log(`Status: ${res1.status} Message: ${res1.data.msg}`);
  const token = res1.data.token;
  const res2 = await axios.post(baseUrl + "private", { token: token });
  console.log(`Status: ${res2.status} Message: ${res2.data.msg}`);
}
test();
