import localforage from 'localforage';

const searchHistory = [];

const getSearchHistory = async () => {
  try {
    const storedHistory = await localforage.getItem('searchHistory');
    if (storedHistory) {
      searchHistory = storedHistory;
    }
  } catch (error) {
    console.error(error);
  }
};

const addSearchHistory = async (city, country) => {
  try {
    searchHistory.push({ city, country });
    await localforage.setItem('searchHistory', searchHistory);
  } catch (error) {
    console.error(error);
  }
};

const getSearchHistoryList = () => {
  return searchHistory;
};

export { getSearchHistory, addSearchHistory, getSearchHistoryList };