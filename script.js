

let apiKey = "703d7e856339df4ee69fe88cfae63762"



async function getWeather(city) {

    try {
        let raw = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
        if (!raw.ok) {
            throw new Error("City not found")
        }
        let realData = await raw.json()
        console.log(realData)
    }
    catch (error) {
        console.log(error.message)
    }
}

getWeather("Nagpur")
