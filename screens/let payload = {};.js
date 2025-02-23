let payload = {};
let url = "localhost:8000/api/postDAta";

async function getData() {
  try {
    let res = await axios.post(url, payload);
    console.log(res);
  } catch (error) {
    console.log(error);
  }
}
