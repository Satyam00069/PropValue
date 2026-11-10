from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseDataProvider(ABC):
    def __init__(self, provider_name: str):
        self.provider_name = provider_name

    @abstractmethod
    def fetch_records(self, locality_name: str, **kwargs) -> List[Dict[str, Any]]:
        """Fetch raw records from the data provider source."""
        pass

    @abstractmethod
    def transform_records(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Clean and normalize raw data into standard PropValue AI schema format."""
        pass

