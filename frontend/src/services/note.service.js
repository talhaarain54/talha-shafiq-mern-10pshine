import API from "../api/axios";


export const getNotesService = async (searchTerm = "", tag = "", sort = "updatedAt") => {
  const params = new URLSearchParams();
  if (searchTerm) params.append("search", searchTerm);
  if (tag) params.append("tag", tag);
  if (sort) params.append("sort", sort);
  const url = `/v1/notes${params.toString() ? `?${params.toString()}` : ""}`;
  const { data } = await API.get(url);
  return data;
};

export const getUserTagsService = async () => {
  const { data } = await API.get("/v1/notes/tags");
  return data;
};

export const getNoteByIdService = async (id) => {
  const { data } = await API.get(`/v1/notes/${id}`);
  return data;
};

export const getTrashedNotesService = async () => {
  const { data } = await API.get("/v1/notes/trash");
  return data;
};

export const createNoteService = async (noteData) => {
  const { data } = await API.post("/v1/notes", noteData);
  return data;
};

export const updateNoteService = async (id, noteData) => {
  const { data } = await API.put(`/v1/notes/${id}`, noteData);
  return data;
};

export const trashNoteService = async (id) => {
  const { data } = await API.delete(`/v1/notes/${id}`);
  return data;
};

export const restoreNoteService = async (id) => {
  const { data } = await API.put(`/v1/notes/restore/${id}`);
  return data;
};

export const deletePermanentService = async (id) => {
  const { data } = await API.delete(`/v1/notes/permanent/${id}`);
  return data;
};
