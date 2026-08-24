#!/bin/sh
# Resilient BGE-M3 pytorch_model.bin downloader for flaky/slow links.
# Resumes with curl -C -, aborts stalled connections (--speed-time), loops,
# then finalizes the file into the HuggingFace cache (blob + snapshot symlink)
# so sentence-transformers loads it from disk with no network.
set -u

URL="https://huggingface.co/BAAI/bge-m3/resolve/main/pytorch_model.bin"
BLOBDIR="/root/.cache/huggingface/hub/models--BAAI--bge-m3/blobs"
SHA="b5e0ce3470abf5ef3831aa1bd5553b486803e83251590ab7ff35a117cf6aad38"
SNAPDIR="/root/.cache/huggingface/hub/models--BAAI--bge-m3/snapshots/5617a9f61b028005a4858fdac845db406aefb181"
PART="$BLOBDIR/$SHA.incomplete"
FINAL="$BLOBDIR/$SHA"
EXPECTED=2271145830

mkdir -p "$BLOBDIR" "$SNAPDIR"

i=0
while :; do
  i=$((i+1))
  have=0
  [ -f "$PART" ] && have=$(wc -c < "$PART")
  [ -f "$FINAL" ] && have=$(wc -c < "$FINAL")
  echo "[loop $i] have=$have / $EXPECTED bytes ($(awk "BEGIN{printf \"%.1f\", $have/$EXPECTED*100}")%)"
  if [ "$have" -ge "$EXPECTED" ]; then
    echo "[loop $i] size complete"
    break
  fi
  # Resume; abort if throughput < 2KB/s for 30s so the loop can reconnect.
  curl -L -C - --speed-limit 2000 --speed-time 30 \
       --connect-timeout 20 --retry 0 \
       -o "$PART" "$URL"
  echo "[loop $i] curl exited $?; sleeping 3s before resume"
  sleep 3
done

# Finalize: move to blob name and create the snapshot symlink HF expects.
if [ ! -f "$FINAL" ]; then
  mv "$PART" "$FINAL"
fi
ln -sf "../../blobs/$SHA" "$SNAPDIR/pytorch_model.bin"

echo "[done] finalized $FINAL"
echo "[done] symlink: $(ls -l "$SNAPDIR/pytorch_model.bin")"
echo "[done] size: $(wc -c < "$FINAL") (expected $EXPECTED)"
