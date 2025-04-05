const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cachedData = require('./cache.js'); 

const app = express();
const PORT = 3010;

app.use(cors());

//roblox api references https://roblox.fandom.com/wiki/List_of_web_APIs
app.get('/api/roblox/users/search', async(req, res)=>{
    try{
        const {keyword, limit = 10} = req.query;

        if(!keyword){
            return res.status(400).json({error: 'Keyword is required'});
        }
        if(cachedData.userName === keyword){
            return res.json(cachedData.data);
        }

        const response = await axios.get(`https://users.roblox.com/v1/users/search`, {
            params: {
              keyword,
              limit
            }
        });
        if(!response || response.status !== 200){
            cachedData.userName='';
            cachedData.data={};
            console.log('Error:', response.statusText);
            return res.status(response.status).json({error: response.statusText});
        }
        cachedData.userName = keyword;
        cachedData.data = response.data;
        res.json(response.data);
    }catch(error){
        console.error('Error fetching data from Roblox API:', error.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

app.get('/api/roblox/avatar-headshot', async (req, res)=>{
    try{
        const {userId, size = 420} = req.query;
        if(!userId){
            return res.status(400).json({error: 'User ID is required'});
        }
        const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot`, {
            params: {
                userIds: userId,
                size,
                format: 'png'
            }
        });
        if(!response || response.status !== 200){
            return res.status(response.status).json({error: response.statusText});
        }
        res.json(response.data);
    }catch(error){
        console.error('Error fetching data from Roblox API:', error.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });