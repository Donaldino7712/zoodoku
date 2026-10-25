<script lang="ts">
	import { importProgress } from "#lib/config.svelte.ts";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";

  if (!page.url.searchParams.has("d")) goto("/");

  function onimport() {
    importProgress(page.url.searchParams.get("d")!);
    goto("/", { replace: true });
  }
</script>
    <div class="flex justify-center items-center flex-col m-16 gap-4">
    <p>Are you sure you want to import?</p>
    <p class="font-extrabold text-error">You will lose all of your current progress!</p>
    <div class="flex gap-4">
        <button class="flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left" onclick={onimport}>Reset and import</button>
        <button class="flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left" onclick={() => goto("/", { replace: true })}>Cancel</button>
    </div>
</div>
