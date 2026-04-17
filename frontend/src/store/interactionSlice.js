import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeInteraction: {
    id: null,
    hcp_id: 1,
    interaction_type: 'Virtual',
    notes: '',
    action_items: '',
    intent_level: 'Neutral',
    sentiment: 'Neutral',
  },
  status: 'idle',
};

export const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state.activeInteraction[field] = value;
    },
    setInteraction: (state, action) => {
      state.activeInteraction = { ...state.activeInteraction, ...action.payload };
    },
    resetInteraction: (state) => {
      state.activeInteraction = initialState.activeInteraction;
    }
  },
});

export const { updateField, setInteraction, resetInteraction } = interactionSlice.actions;

export default interactionSlice.reducer;
