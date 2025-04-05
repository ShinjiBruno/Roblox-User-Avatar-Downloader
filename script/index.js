const PORT=3010;

const resetWarningStyle = () =>{
    const warningDiv = document.getElementById('warning_text');
    warningDiv.textContent = '';
    warningDiv.style.color = 'red';
}

async function searchRobloxUserName(){
    const input = document.getElementById("robloxUserNameInput")
    const selectSize = document.getElementById('select-size');
    const warningDiv = document.getElementById('warning_text');
    resetWarningStyle();

    if(!input || !selectSize) return

    if(selectSize.value === '0'){
        warningDiv.textContent = 'Please select a size.';
        return
    }
    
    const userName = input.value;
    if(!userName || input.value === '') {
        warningDiv.textContent = 'Please enter a username.';
        return
    }
    
    try {
        const response = await fetch(`http://localhost:${PORT}/api/roblox/users/search?keyword=${encodeURIComponent(userName)}&limit=10`);
        
        if(!response.ok) {
            warningDiv.textContent = 'Error searching for user. Please try again later';
            console.log('Error:', response.statusText)
            return
        }
        
        const responseData = await response.json();
        const data = responseData.data;
        
        if(!data || data.length === 0) {
            warningDiv.textContent = 'No users found.';
            console.log('No users found');
            return;
        }
        if(data.length > 1){
            console.log('Multiple users found:', data.length);
            displayUserProfilePictures(data[0]);

            return;
        }
        
        console.log('User ID:', data[0].id);
        displayUserProfilePictures( data[0]);
    } catch (error) {
        warningDiv.textContent = 'Error searching for user. Please try again later';
        console.error('Error searching for user:', error);
    }
}

function displayUserProfilePictures(userData) {
    const resultsContainer = document.getElementById('results');
    const usernameDisplay = document.getElementById('username-display');
    const profileImagesContainer = document.getElementById('profile-images');
    const selectSize = document.getElementById('select-size');

    profileImagesContainer.innerHTML = '';
    
    usernameDisplay.textContent = `Profile Pictures for ${userData.name}`;
    
    resultsContainer.classList.remove('hidden');
    

    const userId = userData.id;
    const selectSizeValue = selectSize.children[selectSize.selectedIndex].textContent.split('x');
    const width = selectSizeValue[0];
    const height = selectSizeValue[1];

    fetch(`http://localhost:${PORT}/api/roblox/avatar-headshot?userId=${userId}&size=${width}x${height}`)
        .then((response) => {
            if(!response.ok) {
                console.log('Error:', response.statusText)
                return
            }
            return response.json()
        })
        .then((data) => {
            if(!data || data.data.length === 0) {
                console.log('No profile picture found');
                return;
            }
            
            data.data.forEach((imageData) => {
                const imageUrl = imageData.imageUrl;
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = `Profile Picture for ${userData.name}`;
                img.width = width;
                img.height = height;
                
                profileImagesContainer.appendChild(img);
            });
        })
        .catch((error) => {
            console.error('Error fetching profile pictures:', error);
        });
}