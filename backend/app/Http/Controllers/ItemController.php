<?php

namespace App\Http\Controllers;

use App\Http\Requests\Item\StoreRequest;
use App\Http\Requests\Item\UpdateRequest;
use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Item::orderBy("id", "desc")->paginate(request('itemsPerPage') ?? 15);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request)
    {
        $data = $request->validated();

        if (isset($request->src)) {
            $file = $request->file('src');
            $ext = $file->getClientOriginalExtension();
            $fileName = time() . '.' . $ext;
            $request->file('src')->move(public_path('items'), $fileName);
            $data['src'] = $fileName;
        }

        return Item::create($data);
    }

    /**
     * Display the specified resource.
     */
    public function show(Item $Item)
    {
        return $Item;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, Item $Item)
    {
        $data = $request->validated();

        if (isset($request->src)) {
            $file = $request->file('src');
            $ext = $file->getClientOriginalExtension();
            $fileName = time() . '.' . $ext;
            $request->file('src')->move(public_path('items'), $fileName);
            $data['src'] = $fileName;
        }


        $Item->update($data);

        return $Item;
    }


    public function itemUpdate(UpdateRequest $request, $id)
    {
        $data = $request->validated();

        if (isset($request->src)) {
            $file = $request->file('src');
            $ext = $file->getClientOriginalExtension();
            $fileName = time() . '.' . $ext;
            $request->file('src')->move(public_path('items'), $fileName);
            $data['src'] = $fileName;
        }

        return Item::where("id", $id)->update($data);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Item $Item)
    {
        $Item->delete();

        return response()->noContent();
    }
}
