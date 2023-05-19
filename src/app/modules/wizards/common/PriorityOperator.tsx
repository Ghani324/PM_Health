import { GridFilterItem, GridFilterOperator } from "@mui/x-data-grid-pro";

const PriorityOperators: GridFilterOperator[] = [
    {
        label: 'Select',
        value: '',
        getApplyFilterFn: (filterItem: GridFilterItem) => {
            if (
                !filterItem.field ||
                !filterItem.value ||
                !filterItem.operator
            ) {
                return null;
            }

            return (params): boolean => {
                return Number(params.value) >= Number(filterItem.value);
            };
        },
    },
    {
        label: 'Normal',
        value: "0",
        getApplyFilterFn: (filterItem: GridFilterItem) => {
            if (
                !filterItem.field ||
                !filterItem.value ||
                !filterItem.operator
            ) {
                return null;
            }

            return (params): boolean => {
                return Number(params.value) >= Number(filterItem.value);
            };
        },
    },
    {
        label: 'High',
        value: "1",
        getApplyFilterFn: (filterItem: GridFilterItem) => {
            if (
                !filterItem.field ||
                !filterItem.value ||
                !filterItem.operator
            ) {
                return null;
            }
            return (params): boolean => {
                return Number(params.value) >= Number(filterItem.value);
            };
        },
    },
]

export {PriorityOperators}