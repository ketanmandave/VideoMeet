let IS_PROD = true;

const server = IS_PROD ? 
{
    prod: "https://videomeet-q7s9.onrender.com"
} : {   
    dev: "http://localhost:8000"
};

export default server;

