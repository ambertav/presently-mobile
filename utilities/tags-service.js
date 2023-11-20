import sendRequest from "./send-request";
import { WEB_BASE_URL } from "./constants";

const BASE_URL = `${WEB_BASE_URL}/`;

export async function addTag(id, tag) {
  console.log("ID AND TAG", id, tag);
  const friend = await sendRequest(
    BASE_URL + `friends/${id}/tags`,
    "POST",
    tag
  );
  return friend;
}

export async function getTags() {
  const friend = await sendRequest(BASE_URL + `tags`, "GET", null);
  return friend;
}

export async function removeTag(id, tagId) {
  console.log("ID AND TAG", id, tagId);
  const friend = await sendRequest(
    BASE_URL + `friends/${id}/tags/${tagId}`,
    "DELETE",
    null
  );
  return friend;
}
