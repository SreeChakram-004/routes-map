import { useRef, useEffect, useState } from 'react';
import './App.css';
import Button from './components/Button/Button';
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import * as tt from "@tomtom-international/web-sdk-maps";
import * as ttapi from "@tomtom-international/web-sdk-services";

function App() {
  const mapElement=useRef()
  const [map,setMap]=useState({})
  const [latitude,setLatitude] = useState(11.5);
  const [longitude,setLongitude] = useState(77.59);

  
  const convertToPoints = (lngLat) => {
    return {
      point: {
        latitude: lngLat.lat,
        longitude: lngLat.lng
      }
    }
  }

  const drawRoute = (geoJson, map) => {
    if (map.getLayer('route')) {
      map.removeLayer('route')
      map.removeSource('route')
    }
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geoJson
      },
      paint: {
        'line-color': '#4a90e2',
        'line-width': 6
  
      }
    })
  }




  const addDeliveryMarker = (lngLat, map) => {
    const element = document.createElement('div')
    element.className = 'marker-delivery'
    new tt.Marker({
      element: element
    })
    .setLngLat(lngLat)
    .addTo(map)
  }










  useEffect(()=>{
    const origin= {
      lng: longitude,
      lat: latitude,
    }

    const destinations = []

    let map = tt.map({
      key:`RLyGKvYNQWuAAxzrPOEHv3Ue0ou9APEC`,
      container:mapElement.current,
      stylesVisibility:{
        trafficIncidents:true,
        trafficFlow: true

      },
      center:[longitude, latitude],
      zoom:7.5
  })
     setMap(map)

     const addMarker = () => {
      const popupOffset = {
        bottom: [0, -25]
      }
      const popup = new tt.Popup({ offset: popupOffset }).setHTML('This is you!')
      const element = document.createElement('div')
      element.className = 'marker'

      const marker = new tt.Marker({
        draggable: true,
        element: element,
      })
        .setLngLat([longitude, latitude])
        .addTo(map)
      
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat()
        setLongitude(lngLat.lng)
        setLatitude(lngLat.lat)
      })

      marker.setPopup(popup).togglePopup()
      
    }
    addMarker()


    //api


    const sortDestinations = (locations) => {
      const pointsForDestinations = locations.map((destination) => {
        return convertToPoints(destination)
      })
      const callParameters = {
        key: `RLyGKvYNQWuAAxzrPOEHv3Ue0ou9APEC`,
        destinations: pointsForDestinations,
        origins: [convertToPoints(origin)],
      }

    return new Promise((resolve, reject) => {
      ttapi.services
        .matrixRouting(callParameters)
        .then((matrixAPIResults) => {
          const results = matrixAPIResults.matrix[0]
          const resultsArray = results.map((result, index) => {
            return {
              location: locations[index],
              drivingtime: result.response.routeSummary.travelTimeInSeconds,
            }
          })
          resultsArray.sort((a, b) => {
            return a.drivingtime - b.drivingtime
          })
          const sortedLocations = resultsArray.map((result) => {
            return result.location
          })
          resolve(sortedLocations)
        })
      })
    }   
    //routes


    const recalculateRoutes = () => {
      sortDestinations(destinations).then((sorted) => {
        sorted.unshift(origin)

        ttapi.services
          .calculateRoute({
            key: `RLyGKvYNQWuAAxzrPOEHv3Ue0ou9APEC`,
            locations: sorted,
          })
          .then((routeData) => {
            const geoJson = routeData.toGeoJson()
            drawRoute(geoJson, map)
        })
      })
    }

    map.on('click', (e) => {
      destinations.push(e.lngLat)
      addDeliveryMarker(e.lngLat, map)
      recalculateRoutes()
    })
  
     
     return()=>map.remove()

  },[latitude,longitude])
  
  return (
    <>
    {map &&
    <div className="App">

     <div className="left-top">
       <Button />
     </div>
     
     <div className="main-content">
       <div className="container">
         <div className="search-bar">
           <div className="navbar">

             <div className="input-box">
               <span className="input">
               <input type="text" id="longitude" className='longitude'
             placeholder="Enter Longitude"
             onChange={(e)=>setLongitude(e.target.value)}/>
               </span>

               <span className="input">
               <input type="text" id="latitude" className='latitude'
             placeholder="Enter Latitude"
             onChange={(e)=>setLatitude(e.target.value)}/>

               </span>
             </div>
            
             
           </div>
         </div>
         <div ref={mapElement} className="map"></div>
       </div>
     </div>
                 
     
     </div>
    }
    </>
  );
}

export default App;
