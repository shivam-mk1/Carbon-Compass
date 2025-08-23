import pickle
import numpy as np
from datetime import datetime
import os
from config import Config

class CarbonEmissionPredictor:
    def __init__(self):
        self.model = None
        self.model_info = None
        self.load_model()
    
    def load_model(self):
        """Load the trained model and metadata"""
        try:
            model_path = os.path.join(Config.MODEL_PATH, Config.MODEL_FILE)
            info_path = os.path.join(Config.MODEL_PATH, Config.MODEL_INFO_FILE)
            
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            with open(info_path, 'rb') as f:
                self.model_info = pickle.load(f)
                
            print("✅ Model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise
    
    def predict_co2(self, latitude, longitude, date=None, **kwargs):
        """
        Predict CO2 emission for given coordinates
        """
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        dt = datetime.strptime(date, '%Y-%m-%d')
        month = dt.month
        day_of_week = dt.weekday()
        
        # Estimate city characteristics
        population_factor = self._estimate_population_factor(latitude, longitude)
        industrial_level = min(0.9, population_factor * 0.3)
        
        # Seasonal factors
        seasonal_factor = self._get_seasonal_factor(month)
        temp_base = self._get_temperature_base(month, latitude)
        
        # Climate factor
        climate_factor = self._get_climate_factor(latitude)
        
        # Default features
        features = {
            'temperature_c': temp_base + kwargs.get('temperature_offset', 0),
            'humidity_percent': kwargs.get('humidity', 65),
            'ndvi': kwargs.get('ndvi', 0.35 if month in [6,7,8,9] else 0.3),
            'lst': temp_base + population_factor,
            'population_factor': population_factor,
            'industrial_level': industrial_level,
            'traffic_factor': min(1.2, population_factor * 0.4),
            'seasonal_factor': seasonal_factor,
            'day_of_week': day_of_week,
            'month': month
        }
        
        # Update with provided kwargs
        features.update(kwargs)
        
        # Create feature vector
        feature_order = self.model_info['feature_columns']
        feature_vector = np.array([[features[col] for col in feature_order]])
        
        # Make prediction
        predicted_co2 = float(self.model.predict(feature_vector)[0])
        
        return {
            'latitude': latitude,
            'longitude': longitude,
            'predicted_co2_ppm': round(predicted_co2, 2),
            'prediction_date': date,
            'emission_level': self._get_emission_level(predicted_co2),
            'confidence': 'High' if self.model_info['performance']['r2'] > 0.9 else 'Medium',
            'model_version': self.model_info.get('model_type', 'XGBoost'),
            'features_used': {k: round(v, 3) if isinstance(v, float) else v for k, v in features.items()}
        }
    
    def predict_batch(self, locations):
        """Predict for multiple locations"""
        results = []
        for location in locations:
            try:
                result = self.predict_co2(**location)
                results.append(result)
            except Exception as e:
                results.append({
                    'error': str(e),
                    'location': location
                })
        return results
    
    def _estimate_population_factor(self, lat, lon):
        """Estimate population factor based on coordinates"""
        major_cities = {
            (28.7, 77.1): 3.29,  # Delhi
            (19.1, 72.9): 2.17,  # Mumbai
            (22.6, 88.4): 1.51,  # Kolkata
            (13.1, 80.3): 1.13,  # Chennai
            (12.97, 77.59): 1.36  # Bangalore
        }
        
        min_distance = float('inf')
        population_factor = 1.0
        
        for (city_lat, city_lon), pop_factor in major_cities.items():
            distance = ((lat - city_lat)**2 + (lon - city_lon)**2)**0.5
            if distance < min_distance:
                min_distance = distance
                population_factor = pop_factor * max(0.3, 1 - distance*2)
        
        return population_factor
    
    def _get_seasonal_factor(self, month):
        """Get seasonal factor based on month"""
        if month in [12, 1, 2]:  # Winter
            return 1.3
        elif month in [3, 4, 5]:  # Summer
            return 1.2
        elif month in [6, 7, 8, 9]:  # Monsoon
            return 0.9
        else:  # Post-monsoon
            return 1.25
    
    def _get_temperature_base(self, month, latitude):
        """Get base temperature"""
        if month in [12, 1, 2]:  # Winter
            temp_base = 20
        elif month in [3, 4, 5]:  # Summer
            temp_base = 35
        elif month in [6, 7, 8, 9]:  # Monsoon
            temp_base = 28
        else:  # Post-monsoon
            temp_base = 25
        
        # Adjust for latitude
        if latitude > 28:  # Northern
            temp_base -= 3
        elif latitude < 15:  # Southern
            temp_base += 2
        
        return temp_base
    
    def _get_climate_factor(self, latitude):
        """Get climate factor based on latitude"""
        if latitude > 28:
            return 1.2
        elif latitude < 15:
            return 1.1
        else:
            return 1.0
    
    def _get_emission_level(self, co2_ppm):
        """Categorize emission level"""
        if co2_ppm > 480:
            return 'High'
        elif co2_ppm > 440:
            return 'Medium'
        else:
            return 'Low'
    
    def get_model_info(self):
        """Get model information"""
        return {
            'model_type': self.model_info.get('model_type', 'XGBoost'),
            'training_date': self.model_info.get('training_date'),
            'performance': self.model_info.get('performance', {}),
            'feature_columns': self.model_info.get('feature_columns', []),
            'cities_covered': self.model_info.get('cities_covered', [])
        }