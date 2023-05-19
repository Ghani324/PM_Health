const TableStyles  = {
    overflowX: 'scroll',
    "& .MuiDataGrid-main": {
        // remove overflow hidden overwise sticky does not work
        overflow: "unset"
    },
    "& .MuiDataGrid-columnHeaders": {
        position: "sticky",
        fontSize:"larger",
    },
    "& .MuiDataGrid-virtualScroller": {
        // remove the space left for the header
        marginTop: "0!important"
    },
    scrollbarColor: "#6b6b6b #2b2b2b",
    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
        height: "20px",
        width: "10px"
    },
    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
        borderRadius: 8,
        backgroundColor: "#6B6B6B",
        minHeight: 24,
        border: "3px solid #6B6B6B",
    },
    "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
        backgroundColor: "#6B6B6B",
    },
    "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
        backgroundColor: "#6B6B6B",
    },
    //   "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
    //     backgroundColor: "#a5cd39",
    //   },
    "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
        backgroundColor: "#6B6B6B",
    },
}

export {TableStyles}