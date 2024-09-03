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

const MyDataTable = () => {
    const [data, setData] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(12);
    const [loading, setLoading] = useState(false);
    const [selectedIDs, setSelectedIDs] = useState<Set<number>>(new Set());
    const [currentPageData, setCurrentPageData] = useState<any[]>([]);

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
                    const items = response.data.data;
                    for (let j = 0; j < Math.min(rows, value - startIndex); j++) {
                        if (items[j]) {
                            newSelectedIDs.add(items[j].id as number);
                        }
                    }
                    setSelectedIDs(newSelectedIDs);
                });
        }
    };

    const handleSelectionChange = (e: { value: number[] }) => {
        const newSelectedIDs = new Set<number>(e.value.map((item: number) => item.id as number));
        setSelectedIDs(newSelectedIDs);
    };

    const isSelected = (rowData: number) => selectedIDs.has(rowData.id as number);

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
                    selection={currentPageData.filter((item) => isSelected(item))}
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
