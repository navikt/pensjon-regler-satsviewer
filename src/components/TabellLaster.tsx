import {FC} from "react";
import {Skeleton, VStack} from "@navikt/ds-react";

const TabellLaster: FC = () => (
    <VStack gap="space-8" aria-busy="true" aria-label="Laster satser">
        {Array.from({length: 8}, (_, i) => <Skeleton key={i} variant="rounded" height={32}/>)}
    </VStack>
);

export default TabellLaster;
