<script lang="ts">
    import { writable } from 'svelte/store';

    // constants
    const apiKey = 'AIzaSyCEklPNeczSbFvbtz5lKFAyBOdAxnLH6Jw';
    let mapUrl: string;
    let streetUrl: string;

    function updateUrlMap() {
        mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent($address)}&maptype=satellite&zoom=${$zoom}&size=${width}x${height}&key=${apiKey}`;
        streetUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${encodeURIComponent($address)}&key=${apiKey}`;
    };

    async function downloadMap() {
        // download map
        try {
            let response = await fetch(mapUrl);
            let blob = await response.blob();
            let link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'map.png';
            link.click();
        } catch (error) {
            console.error('Error downloading the map image:', error);
        };
    };

    async function downloadStreet() {
        // download street view
        try {
            let response = await fetch(streetUrl);
            let blob = await response.blob();
            let link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'street.png';
            link.click();
        } catch (error) {
            console.error('Error downloading the street view image:', error);
        };
    };

    // stores
    const address = writable('New York');
    const zoom = writable(19);
    const width: number = 600;
    const height: number = 400;

    // update on load
    updateUrlMap();
</script>

<h1 class='page-title red'>Map Views</h1>

<div class='flex-column'>
    <div class='page-box'>
        <img src="{mapUrl}" alt="Google Map"/>
        <button on:click={downloadMap}>Download</button>
    </div>
    <div class='page-box'>
        <img src="{streetUrl}" alt="Street View"/>
        <button on:click={downloadStreet}>Download</button>
    </div>
</div>


<div class='page-box'>
    <form on:submit={updateUrlMap} class='flex-row'>
        <label>
            Address
            <input
            placeholder='address'
            name='address'
            bind:value={$address}
        />
        </label>
        <label>
            Zoom
            <input
                placeholder='zoom'
                name='zoom'
                type="number"
                bind:value={$zoom}
                max=20
                min=1
            />
        </label>
        <button type='submit'>
            Load
        </button>
    </form>
</div>
