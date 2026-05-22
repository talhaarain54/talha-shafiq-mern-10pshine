import API from "../api/axios";


export const getNotesService = async (searchTerm = "") => {
  const url = searchTerm ? `/v1/notes?search=${searchTerm}` : "/v1/notes";
  const { data } = await API.get(url);
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
