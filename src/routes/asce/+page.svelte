<script lang='ts'>
    import {writable} from 'svelte/store';

    function download() {
        let link = document.createElement('a');
        link.href = '/downloads/ASCEDesignHazardsReport.pdf'; // Correct path to your file in the static folder
        link.download = 'ASCEDesignHazardsReport.pdf'; // Desired download name
        link.click();
    };

    function loadingTrue() {
        loading.update((l) => {
            return true;
        });
    };

    const loading = writable(false);
</script>

<h1 class='page-title red'>ASCE</h1>
<div class='page-box'>
    <p class='red'>After the pdf finishes loading, please wait a few seconds to allow it to update in the system before downloading.</p>
</div>

<form method='POST' action='?/get-asce-data' class='flex-column page-box'>
    <label>
        Address
        <input
            name='address'
            type='text'
            value={'412 Sandy Ridge Dr, League City TX'}
            required
        />
    </label>
    <label>
        Standard Version
            <select
                name='version'
                required
            >
                <option value='7-10'>ASCE/SEI 7-10</option>
                <option value='7-16'>ASCE/SEI 7-16</option>
                <option value='7-22'>ASCE/SEI 7-22</option>
                <option value='41-17'>ASCE/SEI 41-17</option>
                <option value='41-23'>ASCE/SEI 41-23</option>
            </select>
    </label>
    <label>
        Site Soil Class
        <select
            name='soil'
            required
        >
            <option value='0'>Default</option>
            <option value='1'>A - Hard Rock</option>
            <option value='2'>B - Rock</option>
            <option value='3'>BC</option>
            <option value='4'>C - Very Dense Soil and Hard Rock</option>
            <option value='5'>CD</option>
            <option value='6'>D - Stiff Soil</option>
            <option value='7'>DE</option>
            <option value='8'>E - Soft Clay Soil</option>
        </select>
    </label>
    <label>
        Risk Category
        <select
            name='risk'
            required
        >
            <option value='1'>I</option>
            <option value='2'>II</option>
            <option value='3'>III</option>
            <option value='4'>IV</option>
        </select>
    </label>     
    
    <button type='submit' on:click={loadingTrue}>Submit</button>
</form>

{#if $loading}
    <p>loading...</p>
{/if}

<button on:click={download}>Download</button>

