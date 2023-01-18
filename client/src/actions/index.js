import axios from 'axios';
import { FETCH_USER, FETCH_BLOGS, FETCH_BLOG } from './types';

export const fetchUser = () => async dispatch => {
  const res = await axios.get('/api/current_user');

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const handleToken = token => async dispatch => {
  const res = await axios.post('/api/stripe', token);

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const submitBlog = (values,file, history) => async dispatch => {

  /*const uploadConfig = await axios.get('/api/upload'); // se obtiene la configuracion para subir el archivo a amazon s3

  await axios.put(uploadConfig.data.url,file,{ // se sube al archivo a amazon
    headers: {
      'content-type': 'application/octet-stream' // toma el mimetype de forma dinamica
    }
  });*/
  console.log(file)
  const form = new FormData();
  
  form.append('title',values.title);
  form.append('content',values.content);
  form.append('file',file);

  const res = await axios.post('/api/blogs', form);

  history.push('/blogs');
  dispatch({ type: FETCH_BLOG, payload: res.data });
};

export const fetchBlogs = () => async dispatch => {
  const res = await axios.get('/api/blogs');

  dispatch({ type: FETCH_BLOGS, payload: res.data });
};

export const fetchBlog = id => async dispatch => {
  const res = await axios.get(`/api/blogs/${id}`);

  dispatch({ type: FETCH_BLOG, payload: res.data });
};
