import React, {Component} from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';

import Toast from 'react-native-simple-toast';

import GoogleMapsView from './GoogleMapsView';
import GooglePlacesView from './GooglePlacesView';

class PlacesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPlace: {name: 'Islamabad', address: 'Pakistan'},
      getCurrentLocationResponseReceived: false,

      mapReady: false,

      googlePlacesViewVisible: false,

      regionCircleVisible: false,

      placesInputBusy: false,
      confirmBtnBusy: false,

      searchResultData: {
        suspected: 0,
        confirmed: 0,
      },
    };
    this.mapRegion = {
      latitude: 33.6844,
      longitude: 73.0479,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    this.API_KEY = 'YOUR_GOOGLE_API_KEY';

    this.mapPanDragByUser = false;

    Geocoder.init(this.API_KEY);
  }
  async componentDidMount() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.getCurrentLocation();
      } else {
        Toast.show('location permission denied');
      }
    } catch (error) {
      console.warn(error);
    }
  }

  getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('getCurrentPosition', position);
        this.setLocationFromCoords(position.coords);
      },
      (error) => {
        console.log(
          'PlacesScreen.getCurrentLocation encountered error: code: ' +
            error.code,
          '; message: ',
          error.message,
        );
        Toast.show(error.message);
        this.setState({getCurrentLocationResponseReceived: true});
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  setLocationFromCoords = async (coordinates) => {
    this.setMapRegion(
      coordinates.latitude,
      coordinates.longitude,
      coordinates.latitudeDelta,
      coordinates.longitudeDelta,
    );
    Geocoder.from(coordinates.latitude, coordinates.longitude)
      .then((json) => {
        let name = json.results[0].address_components[0].long_name;
        let address = json.results[0].formatted_address;
        this.setState({
          selectedPlace: {name: name, address: address},
          getCurrentLocationResponseReceived: true,
          placesInputBusy: false,
          confirmBtnBusy: false,
        });
      })
      .catch((error) => {
        console.warn(error);
        this.setState({
          selectedPlace: {name: '-', address: '-'},
          getCurrentLocationResponseReceived: true,
          placesInputBusy: false,
          confirmBtnBusy: false,
        });
      });
  };

  setMapRegion = (
    latitude,
    longitude,
    latitudeDelta = 0.00222,
    longitudeDelta = 0.00421,
    name = '-',
    address = '-',
    maintainDelta = false,
    updatePlaceNameAndAddress = false,
  ) => {
    if (
      maintainDelta &&
      this.mapRegion != null &&
      this.mapRegion.latitudeDelta != null &&
      this.mapRegion.longitudeDelta != null
    ) {
      latitudeDelta = this.mapRegion.latitudeDelta;
      longitudeDelta = this.mapRegion.longitudeDelta;
    }

    this.mapRegion = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      latitudeDelta: parseFloat(latitudeDelta),
      longitudeDelta: parseFloat(longitudeDelta),
    };
    if (this.mapViewRef && this.mapViewRef.animateToRegion)
      this.mapViewRef.animateToRegion(this.mapRegion, 300);

    if (updatePlaceNameAndAddress) {
      this.setState({selectedPlace: {name: name, address: address}});
    }
  };

  // map functions  >>>>>
  handleMapReady = () => {
    console.log('Map ready');
    this.setState({mapReady: true});
  };
  handleMapPress = () => {
    this.setState({googlePlacesViewVisible: false});
  };
  handleMapPoiPress = async (event) => {
    this.setState({
      googlePlacesViewVisible: false,
      placesInputBusy: true,
      confirmBtnBusy: true,
    });

    const placeId = event.nativeEvent.placeId;
    const placeLat = event.nativeEvent.coordinate.latitude;
    const placeLng = event.nativeEvent.coordinate.longitude;
    const placeName = event.nativeEvent.name;

    const placeDetails = await fetch(
      'https://maps.googleapis.com/maps/api/place/details/json?key=' +
        this.API_KEY +
        '&place_id=' +
        placeId +
        //'&fields=address_component,adr_address,business_status,formatted_address,geometry,icon,name,permanently_closed,photo,place_id,plus_code,type,url,utc_offset,vicinity',
        '&fields=address_component,formatted_address',
      {
        method: 'get',
        headers: {
          Accept: 'application/json',
          //'Content-Type': 'application/json',
        },
      },
    )
      .then((response) => response.json())
      .then((response) => {
        console.log(
          'Google place API request succeeded with response: ',
          response,
        );
        if (response.status === 'OK') {
          const name = response.result.address_components[0].long_name;
          const address = response.result.formatted_address;
          return {name: name, address: address};
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.log('Google place API request failed: ', error);
        return null;
      });

    const placeAddress = placeDetails == null ? '-' : placeDetails.address;

    this.setState({confirmBtnBusy: false, placesInputBusy: false}, () => {
      this.setMapRegion(
        placeLat,
        placeLng,
        undefined,
        undefined,
        placeName,
        placeAddress,
        true,
        true,
      );
    });

    // Not setting here to false avoid flicker as onRegionChange() sets back to true. (The region change is triggered by setMapRegion above.)
    // Set to false eventually by onRegionChangeComplete().
  };
  handleMapRegionChange = () => {
    this.setState((prevState) => {
      if (prevState.googlePlacesViewVisible) {
        return {googlePlacesViewVisible: false};
      } else {
        return null;
      }
    });
  };
  hanldeMapPanDragByUser = () => {
    this.mapPanDragByUser = true;
  };
  handleMapDoubleTap = () => {
    this.mapPanDragByUser = true;
  };
  hanldeMapRegionChangeComplete = (coordinates) => {
    if (!this.mapPanDragByUser) return;

    this.setState({
      confirmBtnBusy: true,
      placesInputBusy: true,
    });
    this.setLocationFromCoords(coordinates);

    this.mapPanDragByUser = false;
  };
  // <<<<

  // Places input functions >>>>>
  handlePlacesBtnPress = () => {
    this.setState((prevState) => {
      if (prevState.placesInputBusy) return null;
      return {googlePlacesViewVisible: true};
    });
  };
  handlePlacesDismiss = () => {
    this.setState({googlePlacesViewVisible: false});
  };
  handlePlaceSelect = (place) => {
    this.setState(
      {
        googlePlacesViewVisible: false,
      },
      () => {
        this.setMapRegion(
          place.result.geometry.location.lat,
          place.result.geometry.location.lng,
          undefined,
          undefined,
          place.result.name,
          place.result.formatted_address,
          false,
          true,
        );
      },
    );
  };
  // <<<<

  render() {
    // console.log('##### PlacesScreen render');
    if (!this.state.getCurrentLocationResponseReceived) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <SafeAreaView style={{flex: 1}}>
        <GoogleMapsView
          ref={(ref) => {
            this.mapViewRef = ref;
          }}
          region={this.mapRegion}
          mapReady={this.state.mapReady}
          handleMapReady={this.handleMapReady}
          handleMapPress={this.handleMapPress}
          handleMapPoiPress={this.handleMapPoiPress}
          handleMapRegionChange={this.handleMapRegionChange}
          hanldeMapRegionChangeComplete={this.hanldeMapRegionChangeComplete}
          hanldeMapPanDragByUser={this.hanldeMapPanDragByUser}
          handleMapDoubleTap={this.handleMapDoubleTap}
        />

        <MyLocationBtn getCurrentLocation={this.getCurrentLocation} />

        <GooglePlacesView
          googlePlacesViewVisible={this.state.googlePlacesViewVisible}
          placesInputBusy={this.state.placesInputBusy}
          selectedPlace={this.state.selectedPlace}
          API_KEY={this.API_KEY}
          region={this.mapRegion}
          handlePlacesBtnPress={this.handlePlacesBtnPress}
          handlePlacesDismiss={this.handlePlacesDismiss}
          handlePlaceSelect={this.handlePlaceSelect}
        />
      </SafeAreaView>
    );
  }
}

const MyLocationBtn = (props) => {
  return (
    <View
      style={{
        position: 'absolute',
        width: 30,
        height: 30,
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 6,
        bottom: 50,
        right: 20,
        elevation: 2,
        zIndex: 100,
      }}>
      <TouchableOpacity
        style={{
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={props.getCurrentLocation}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            borderColor: '#ddd',
            borderWidth: 4,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default PlacesScreen;
