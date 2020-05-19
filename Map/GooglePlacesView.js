import React from 'react';
import RNPlacesInput from 'react-native-places-input';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';

const GooglePlacesView = (props) => {
  // console.log('##### GooglePlacesView render');
  return (
    <>
      {!props.googlePlacesViewVisible ? (
        <View style={Styles.searchButton}>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={props.handlePlacesBtnPress}>
            <View style={Styles.orangeCirlce} />
            {props.placesInputBusy ? (
              <ActivityIndicator color="#808080" size={18} />
            ) : (
              <View style={{flex: 1}}>
                <Text numberOfLines={1} style={Styles.searchPrimaryText}>
                  {props.selectedPlace.name}
                </Text>
                {props.selectedPlace.address &&
                  props.selectedPlace.address !== '' && (
                    <Text numberOfLines={1} style={Styles.searchSecondaryText}>
                      {props.selectedPlace.address}
                    </Text>
                  )}
              </View>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={Styles.dismissBtnContainer}>
            <Text style={Styles.dismissBtn} onPress={props.handlePlacesDismiss}>
              &times;
            </Text>
          </View>
          <RNPlacesInput
            stylesContainer={Styles.rNPlacesInputContainer}
            stylesInput={Styles.rNPlacesInput}
            stylesItem={Styles.rNPlacesInputItem}
            stylesItemText={Styles.rNPlacesInputItemText}
            stylesList={Styles.rNPlacesInputList}
            textInputProps={{
              autoFocus: true,
              placeholder: 'Search Places...',
            }}
            contentScrollViewTop={
              <Text style={Styles.headerText}>SEARCH RESULTS</Text>
            }
            googleApiKey={props.API_KEY}
            searchRadius={500}
            searchLatitude={props.region.latitude}
            searchLongitude={props.region.longitude}
            queryCountries={['pk']}
            resultRender={(place) => {
              return [
                place.structured_formatting.main_text,
                '\n',
                place.structured_formatting.secondary_text,
              ];
            }}
            onSelect={props.handlePlaceSelect}
          />
        </>
      )}
    </>
  );
};
const Styles = StyleSheet.create({
  searchButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 6,
    elevation: 5,
    height: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  searchPrimaryText: {fontSize: 16, fontWeight: 'bold', color: '#808080'},
  searchSecondaryText: {fontSize: 14, fontWeight: 'normal', color: '#808080'},
  orangeCirlce: {
    width: 10,
    height: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'orange',
  },
  dismissBtnContainer: {
    position: 'absolute',
    top: 36,
    right: 30,
    width: 40,
    height: 40,
    zIndex: 1001,
    alignContent: 'center',
    backgroundColor: '#ffffff',
  },
  dismissBtn: {
    flex: 1,
    alignSelf: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4287f5',
  },
  rNPlacesInputContainer: {
    backgroundColor: '#f7f7f700',
    top: 24,
    left: 1,
    right: 1,
    paddingTop: 6,
    elevation: 0,
  },
  rNPlacesInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    height: 50,
    marginHorizontal: 20,
    elevation: 5,
    marginBottom: 2,
  },
  rNPlacesInputItem: {
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  rNPlacesInputItemText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 22,
  },
  rNPlacesInputList: {
    elevation: 2,
    marginLeft: 20,
    marginRight: 20,
  },
  headerText: {
    color: '#ccc',
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontWeight: 'bold',
  },
});

export default GooglePlacesView;
