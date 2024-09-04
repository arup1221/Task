import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useState, useEffect } from 'react';
import axios from 'axios';
import OverlayPanelComponent from './OverlayPanelComponent';
import { ProgressSpinner } from 'primereact/progressspinner';

interface PageChangeEvent {
    first: number;
    rows: number;
}

interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: string;
    date_end: string;
}

const MyDataTable = () => {
    const [data, setData] = useState<Artwork[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(12);
    const [loading, setLoading] = useState(false);
    const [selectedIDs, setSelectedIDs] = useState<Set<number>>(new Set());
    const [currentPageData, setCurrentPageData] = useState<Artwork[]>([]);

    useEffect(() => {
        fetchData(first, rows);
    }, [first, rows]);

    const fetchData = async (startIndex: number, rowsPerPage: number) => {
        try {
            setLoading(true);
            const page = Math.floor(startIndex / rowsPerPage) + 1;
            const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`);
            const fetchedData = response.data.data;
            setData(fetchedData);
            setTotalRecords(response.data.pagination.total);
            setCurrentPageData(fetchedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event: PageChangeEvent) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const handleValueSubmit = (value: number) => {
        const newSelectedIDs = new Set<number>();
        const pageCount = Math.ceil(value / rows);

        for (let i = 0; i < pageCount; i++) {
            const startIndex = i * rows;
            axios.get(`https://api.artic.edu/api/v1/artworks?page=${i + 1}&limit=${rows}`)
                .then(response => {
                    const items: Artwork[] = response.data.data;
                    for (let j = 0; j < Math.min(rows, value - startIndex); j++) {
                        if (items[j]) {
                            newSelectedIDs.add(items[j].id);
                        }
                    }
                    setSelectedIDs(newSelectedIDs);
                });
        }
    };

    const handleSelectionChange = (e: { value: Artwork[] }) => {
        const newSelectedIDs = new Set<number>(selectedIDs);

        // Add newly selected items
        e.value.forEach((item) => {
            newSelectedIDs.add(item.id);
        });

        // Identify deselected items by comparing with the previously selected items
        const deselectedIDs = currentPageData
            .filter(item => !e.value.some(selectedItem => selectedItem.id === item.id))
            .map(item => item.id);

        // Remove deselected items
        deselectedIDs.forEach(id => {
            newSelectedIDs.delete(id);
        });

        setSelectedIDs(newSelectedIDs);
    };

    // const isSelected = (rowData: Artwork) => selectedIDs.has(rowData.id);

    return (
        <>
            {loading ? (
                <div className="spinner-container">
                    <ProgressSpinner />
                </div>
            ) : (
                <DataTable
                    value={data}
                    paginator
                    paginatorPosition="bottom"
                    rows={rows}
                    selectionMode="checkbox"
                    selection={data.filter(item => selectedIDs.has(item.id))}
                    totalRecords={totalRecords}
                    onPage={handlePageChange}
                    first={first}
                    lazy
                    onSelectionChange={handleSelectionChange}
                    dataKey="id"
                    rowsPerPageOptions={[6, 12]}
                    tableStyle={{ minWidth: '50rem' }}
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                    <Column header={<OverlayPanelComponent onValueSubmit={handleValueSubmit} />} style={{ width: '5%' }}></Column>
                    <Column field="title" header="Title" style={{ width: '25%' }}></Column>
                    <Column field="place_of_origin" header="Place" style={{ width: '25%' }}></Column>
                    <Column field="artist_display" header="Artist" style={{ width: '25%' }}></Column>
                    <Column field="inscriptions" header="Inscriptions" style={{ width: '25%' }}></Column>
                    <Column field="date_start" header="Start Date" style={{ width: '25%' }}></Column>
                    <Column field="date_end" header="End Date" style={{ width: '25%' }}></Column>
                </DataTable>
            )}
        </>
    );
};

export default MyDataTable;
