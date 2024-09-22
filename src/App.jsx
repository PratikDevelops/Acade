import { useRef, useState } from 'react';

import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import {sortPlacesByDistance} from "./loc.js"
import { useEffect } from 'react';

const storeId = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
    const storePlaces = storeId.map(id=> AVAILABLE_PLACES.find((place) => place.id === id))
   

function App() {
  const modal = useRef();
  const selectedPlace = useRef();
  const [availablePlaces,setAvailablePlaces] = useState([])
  const [pickedPlaces, setPickedPlaces] = useState(storePlaces);

  
  useEffect(()=>{
    navigator.geolocation.getCurrentPosition((postion)=>{
      const sortPlaces = sortPlacesByDistance (
        AVAILABLE_PLACES,
        postion.coords.latitude,
        postion.coords.longitude
      )
      setAvailablePlaces(sortPlaces)
      
    })
  },[])

  

  function handleStartRemovePlace(id) {
    modal.current.open();
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    modal.current.close();
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });
    const storeId = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
    if(storeId.indexOf(id)== -1){
      localStorage.setItem("selectedPlaces",JSON.stringify([id, ...storeId]))
    }
    
  }

  function handleRemovePlace() {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    modal.current.close();
    
    const storeId = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
    localStorage.setItem("selectedPlaces",JSON.stringify(storeId.filter((id)=>id!=selectedPlace.current)))
  }

  return (
    <>
      <Modal ref={modal}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={availablePlaces}
          fallbackText={"Sorting places by distance..."}
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
