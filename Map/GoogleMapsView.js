import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';

import MapView, {PROVIDER_GOOGLE, Circle, Marker} from 'react-native-maps';

const CIRCLE_RADIUS = 50;

class GoogleMapsView extends Component {
  animateToRegion = (region, duration = 300) => {
    if (this.mapViewRef && this.mapViewRef.animateToRegion)
      this.mapViewRef.animateToRegion(region, duration);
  };

  render() {
    console.log('##### GoogleMapsView render');

    return (
      <View style={{flex: 1, justifyContent: 'center', alignContent: 'center'}}>
        <MapView
          ref={(ref) => {
            this.mapViewRef = ref;
          }}
          style={{height: '100%', backgroundColor: 'white'}}
          provider={PROVIDER_GOOGLE}
          initialRegion={this.props.region}
          showsUserLocation={false}
          showsBuildings={true}
          showsPointsOfInterest={true}
          showsTraffic={false}
          showsIndoors={false}
          loadingEnabled={false}
          onMapReady={this.props.handleMapReady}
          onPress={this.props.handleMapPress}
          onPoiClick={this.props.handleMapPoiPress}
          onRegionChange={(coordinates) => {
            if (this.centerMarkerRef)
              this.centerMarkerRef.setCenter(coordinates);
            if (this.props.handleMapRegionChange)
              this.props.handleMapRegionChange();
          }}
          onRegionChangeComplete={this.props.hanldeMapRegionChangeComplete}
          onPanDrag={this.props.hanldeMapPanDragByUser}
          onDoublePress={this.props.handleMapDoubleTap}>
          {/* <CenterMarker
            ref={(ref) => {
              this.centerMarkerRef = ref;
            }}
            center={this.props.region}
          /> */}
          <RegionCircle
            regionCircleVisible={this.props.regionCircleVisible}
            center={this.props.region}
          />
        </MapView>

        {/* Fake marker. This is not accurate, if you zoom out too much, it will give on wrong coordinates. For accuracy use actual maker, which lags but is accurate */}
        <View style={Styles.pin2} />
      </View>
    );
  }
}

// Actual center marker. This is accurate marker but it lags because it uses setState to update. if you want no lag you can use fake marker.
class CenterMarker extends Component {
  state = {center: this.props.center};
  setCenter = (center) => {
    this.setState({center: center});
  };
  render() {
    return (
      <Marker coordinate={this.state.center} anchor={{x: 0.5, y: 0.5}}>
        <View style={Styles.pin} />
      </Marker>
    );
  }
}

const RegionCircle = (props) => {
  if (!props.regionCircleVisible) return null;
  return (
    <Circle
      center={{
        latitude: props.center.latitude,
        longitude: props.center.longitude,
      }}
      radius={CIRCLE_RADIUS}
      strokeWidth={2}
      strokeColor="rgba(0, 0, 255, 0.3)"
      fillColor="rgba(0, 185, 255, 0.3)"
    />
  );
};

const Styles = StyleSheet.create({
  pin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderColor: '#172a50',
    borderWidth: 4,
  },
  pin2: {
    position: 'absolute',
    alignSelf: 'center',
    elevation: 2,
    zIndex: 100,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderColor: 'red',
    borderWidth: 4,
  },
});
export default GoogleMapsView;
