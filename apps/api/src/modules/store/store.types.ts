import { StoreService } from "src/modules/store/store.service";

export     type TStore = Awaited<ReturnType <InstanceType<typeof StoreService>['getStoreInfoFromUserId']>>;
