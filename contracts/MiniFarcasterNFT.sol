// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MiniFarcasterNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct NFT {
        string name;
        uint256 supply;
        uint256 price;
        uint256 minted;
        string tokenURI;
    }

    mapping(uint256 => NFT) public nfts;

    constructor() ERC721("MiniFarcasterNFT", "MFNFT") {}

    function createNFT(
        string memory name,
        uint256 supply,
        uint256 price,
        string memory tokenURI
    ) public returns (uint256) {
        require(supply > 0, "Supply must be greater than 0");
        require(price > 0, "Price must be greater than 0");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        nfts[newTokenId] = NFT(name, supply, price, 0, tokenURI);

        return newTokenId;
    }

    function mintNFT(uint256 tokenId) public payable {
        NFT storage nft = nfts[tokenId];
        require(nft.supply > 0, "NFT does not exist");
        require(nft.minted < nft.supply, "All NFTs have been minted");
        require(msg.value >= nft.price, "Insufficient payment");

        nft.minted++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, nft.tokenURI);

        // Transfer payment to contract owner
        payable(owner()).transfer(msg.value);
    }

    function getNFT(uint256 tokenId) public view returns (NFT memory) {
        return nfts[tokenId];
    }
}