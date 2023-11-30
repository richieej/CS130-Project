import Axios from 'axios';

import { BASE_URL } from '../config';

const axios = Axios.create({
	baseURL: BASE_URL,
});

async function getUser(email) {
	try {
		let data = (
			await axios.get('/users/user', {
				params: {
					email: email,
				},
			})
		).data;
		return data;
	} catch (e) {
		console.log(e);
		throw e;
	}
}

async function getAllUsers() {
	try {
		const data = (await axios.get('/users')).data;
		return data;
	} catch (e) {
		console.log(e);
		throw e;
	}
}

async function createUser(userData) {
  try {
		let data = (
			await axios.post('/users/add', userData)
		).data;
		console.log(data);
		return data;
	} catch (e) {
		console.log(e);
		throw e;
	}
}

async function updateUser(userId, userData) {
  try {
		let data = (
			await axios.post('/users/update', {
				params: {
					id: userId,
				},
			}, userData)
		).data;
		console.log(data);
		return data;
	} catch (e) {
		console.log(e);
		throw e;
	}
}

async function deleteUser(userId) {
  try {
		let data = (
			await axios.delete('/users/', {
				params: {
					id: userId,
				},
			})
		).data;
		return data;
	} catch (e) {
		console.log(e);
		throw e;
	}
}

export default { getUser, getAllUsers, createUser, updateUser, deleteUser };
