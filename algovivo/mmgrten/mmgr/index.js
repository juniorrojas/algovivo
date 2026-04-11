import * as linked from "./linked/index.js";
import { _registerSlotTypes } from "./Slot.js";
import ReservedSlot from "./ReservedSlot.js";
import FreeSlot from "./FreeSlot.js";

_registerSlotTypes(ReservedSlot, FreeSlot);

export { linked };
export { default as MemoryManager } from "./MemoryManager.js";
export { FreeSlot, ReservedSlot };
