import { IStateStorage } from './allTypes';

export class StateStorage implements IStateStorage {
  private currentOffset: number;

  constructor() {
    this.currentOffset = 0;
  }

  getCurrentOffset() {
    return this.currentOffset;
  }

  setCurrentOffset(offset: number) {
    this.currentOffset = offset;
  }
}
