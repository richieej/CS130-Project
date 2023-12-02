import Axios from 'axios';

import { BASE_URL } from '../config';

const axios = Axios.create({
	baseURL: BASE_URL,
});

async function getMapping(uuid) {
	try {
		let data = (
			await axios.get('/mappings/mapping', {
				params: {
					uuid: uuid,
				},
			})
		).data;
		return data;
	} catch (e) {
		console.log(e);
		throw e;
	}
}

async function getAllMappings() {
	try {
		const data = (await axios.get('/mappings')).data;
		return data;
	} catch (e) {
		console.log(e);
		throw e;
	}
}

async function createMapping(mappingData) {
  try {
		let data = (
			await axios.post('/mappings/add', mappingData)
		).data;
		return data;
	} catch (e) {
		console.log(e);
		throw e;
	}
}

async function editMapping(mappingData) {
	try {
		let data = (
			await axios.post('/mappings/edit', mappingData)
		).data;
		return data;
	} catch (e) {
		console.log(e);
		throw e;
	}
}

async function deleteMapping(uuid) {
  try {
		let data = (
			await axios.delete('/mappings', {
				params: {
					uuid: uuid,
				},
			})
		).data;
		return data;
	} catch (e) {
		console.log(e);
		throw e;
	}
}

export default { getMapping, getAllMappings, createMapping, editMapping, deleteMapping }
