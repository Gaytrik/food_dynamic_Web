import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

export const getAllMenuItems = async () => {
  const res = await axios.get(`${BASE_URL}/menu/all`);
  return res.data;
};

export const getAllBoxes = async () => {
  const res = await axios.get(`${BASE_URL}/box`);
  return res.data;
};

export const createBox = async (boxData) => {
    
  const res = await axios.post(`${BASE_URL}/box`, boxData);
  return res.data;
};

export const updateBox = async (id, boxData) => {
  const res = await axios.put(`${BASE_URL}/box/${id}`, boxData);
  return res.data;
};

export const addSabjis = async (id, sabjiIdsToAdd) => {
  const res = await axios.patch(`${BASE_URL}/box/${id}/add`, {
    sabjiIdsToAdd,
  });
  return res.data;
};

export const removeSabjis = async (id, sabjiIdsToRemove) => {
  const res = await axios.patch(`${BASE_URL}/box/${id}/remove`, {
    sabjiIdsToRemove,
  });
  return res.data;
};
